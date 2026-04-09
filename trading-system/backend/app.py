"""
Trading System Backend - Flask API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Database
DATABASE_URL = "sqlite:///trading_system.db"
engine = create_engine(DATABASE_URL, echo=False)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# ============== Models ==============

class Memo(Base):
    __tablename__ = 'memos'
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    logic_group_id = Column(Integer, ForeignKey('logic_groups.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    logic_group = relationship('LogicGroup', foreign_keys=[logic_group_id])

class LogicGroup(Base):
    __tablename__ = 'logic_groups'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(20), default='#6366f1')
    created_at = Column(DateTime, default=datetime.utcnow)
    stocks = relationship('Stock', back_populates='logic_group')

class CustomField(Base):
    __tablename__ = 'custom_fields'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    field_type = Column(String(20), default='text')  # text, number, date
    created_at = Column(DateTime, default=datetime.utcnow)

class Stock(Base):
    __tablename__ = 'stocks'
    id = Column(Integer, primary_key=True)
    code = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    sector = Column(String(100))
    current_price = Column(Float)
    notes = Column(Text)
    logic_group_id = Column(Integer, ForeignKey('logic_groups.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    logic_group = relationship('LogicGroup', back_populates='stocks')
    field_values = relationship('StockFieldValue', back_populates='stock', cascade='all, delete-orphan')

class StockFieldValue(Base):
    __tablename__ = 'stock_field_values'
    id = Column(Integer, primary_key=True)
    stock_id = Column(Integer, ForeignKey('stocks.id'))
    custom_field_id = Column(Integer, ForeignKey('custom_fields.id'))
    value = Column(Text)
    stock = relationship('Stock', back_populates='field_values')
    custom_field = relationship('CustomField')

class TradingModel(Base):
    __tablename__ = 'trading_models'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    drawing_data = Column(JSON)  # Canvas drawing data stored as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MarketEntry(Base):
    __tablename__ = 'market_entries'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    category = Column(String(50), default='index')  # index, sector, news, sentiment, custom
    tags = Column(JSON)  # List of tags
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(engine)

# Migration: add logic_group_id column to memos if not exists
from sqlalchemy import inspect, text
inspector = inspect(engine)
columns = [c['name'] for c in inspector.get_columns('memos')]
if 'logic_group_id' not in columns:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE memos ADD COLUMN logic_group_id INTEGER REFERENCES logic_groups(id)"))
        conn.commit()

# ============== API Routes ==============

# --- Memos ---
@app.route('/api/memos', methods=['GET'])
def get_memos():
    session = Session()
    memos = session.query(Memo).order_by(Memo.updated_at.desc()).all()
    result = []
    for m in memos:
        result.append({
            'id': m.id,
            'content': m.content,
            'logic_group_id': m.logic_group_id,
            'logic_group': {'id': m.logic_group.id, 'name': m.logic_group.name, 'color': m.logic_group.color} if m.logic_group else None,
            'created_at': m.created_at.isoformat(),
            'updated_at': m.updated_at.isoformat()
        })
    session.close()
    return jsonify(result)

@app.route('/api/memos', methods=['POST'])
def create_memo():
    data = request.json
    session = Session()
    memo = Memo(content=data['content'], logic_group_id=data.get('logic_group_id'))
    session.add(memo)
    session.commit()
    result = {
        'id': memo.id,
        'content': memo.content,
        'logic_group_id': memo.logic_group_id,
        'logic_group': {'id': memo.logic_group.id, 'name': memo.logic_group.name, 'color': memo.logic_group.color} if memo.logic_group else None,
        'created_at': memo.created_at.isoformat(),
        'updated_at': memo.updated_at.isoformat()
    }
    session.close()
    return jsonify(result), 201

@app.route('/api/memos/<int:id>', methods=['PUT'])
def update_memo(id):
    data = request.json
    session = Session()
    memo = session.query(Memo).get(id)
    if memo:
        memo.content = data.get('content', memo.content)
        memo.logic_group_id = data.get('logic_group_id', memo.logic_group_id)
        session.commit()
        result = {
            'id': memo.id,
            'content': memo.content,
            'logic_group_id': memo.logic_group_id,
            'logic_group': {'id': memo.logic_group.id, 'name': memo.logic_group.name, 'color': memo.logic_group.color} if memo.logic_group else None,
            'created_at': memo.created_at.isoformat(),
            'updated_at': memo.updated_at.isoformat()
        }
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/memos/<int:id>', methods=['DELETE'])
def delete_memo(id):
    session = Session()
    memo = session.query(Memo).get(id)
    if memo:
        session.delete(memo)
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

# --- Logic Groups ---
@app.route('/api/logic-groups', methods=['GET'])
def get_logic_groups():
    session = Session()
    groups = session.query(LogicGroup).all()
    result = [{'id': g.id, 'name': g.name, 'description': g.description, 'color': g.color, 'created_at': g.created_at.isoformat()} for g in groups]
    session.close()
    return jsonify(result)

@app.route('/api/logic-groups', methods=['POST'])
def create_logic_group():
    data = request.json
    session = Session()
    group = LogicGroup(name=data['name'], description=data.get('description', ''), color=data.get('color', '#6366f1'))
    session.add(group)
    session.commit()
    result = {'id': group.id, 'name': group.name, 'description': group.description, 'color': group.color, 'created_at': group.created_at.isoformat()}
    session.close()
    return jsonify(result), 201

@app.route('/api/logic-groups/<int:id>', methods=['PUT'])
def update_logic_group(id):
    data = request.json
    session = Session()
    group = session.query(LogicGroup).get(id)
    if group:
        group.name = data['name']
        group.description = data.get('description', group.description)
        group.color = data.get('color', group.color)
        session.commit()
        result = {'id': group.id, 'name': group.name, 'description': group.description, 'color': group.color, 'created_at': group.created_at.isoformat()}
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/logic-groups/<int:id>', methods=['DELETE'])
def delete_logic_group(id):
    session = Session()
    group = session.query(LogicGroup).get(id)
    if group:
        session.delete(group)
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

# --- Custom Fields ---
@app.route('/api/custom-fields', methods=['GET'])
def get_custom_fields():
    session = Session()
    fields = session.query(CustomField).all()
    result = [{'id': f.id, 'name': f.name, 'field_type': f.field_type, 'created_at': f.created_at.isoformat()} for f in fields]
    session.close()
    return jsonify(result)

@app.route('/api/custom-fields', methods=['POST'])
def create_custom_field():
    data = request.json
    session = Session()
    field = CustomField(name=data['name'], field_type=data.get('field_type', 'text'))
    session.add(field)
    session.commit()
    result = {'id': field.id, 'name': field.name, 'field_type': field.field_type, 'created_at': field.created_at.isoformat()}
    session.close()
    return jsonify(result), 201

@app.route('/api/custom-fields/<int:id>', methods=['PUT'])
def update_custom_field(id):
    data = request.json
    session = Session()
    field = session.query(CustomField).get(id)
    if field:
        field.name = data['name']
        field.field_type = data.get('field_type', field.field_type)
        session.commit()
        result = {'id': field.id, 'name': field.name, 'field_type': field.field_type, 'created_at': field.created_at.isoformat()}
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/custom-fields/<int:id>', methods=['DELETE'])
def delete_custom_field(id):
    session = Session()
    field = session.query(CustomField).get(id)
    if field:
        session.delete(field)
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

# --- Stocks ---
@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    session = Session()
    stocks = session.query(Stock).all()
    result = []
    for s in stocks:
        field_values = {fv.custom_field_id: fv.value for fv in s.field_values}
        result.append({
            'id': s.id,
            'code': s.code,
            'name': s.name,
            'sector': s.sector,
            'current_price': s.current_price,
            'notes': s.notes,
            'logic_group_id': s.logic_group_id,
            'logic_group': {'id': s.logic_group.id, 'name': s.logic_group.name, 'color': s.logic_group.color} if s.logic_group else None,
            'field_values': field_values,
            'created_at': s.created_at.isoformat()
        })
    session.close()
    return jsonify(result)

@app.route('/api/stocks', methods=['POST'])
def create_stock():
    data = request.json
    session = Session()
    stock = Stock(
        code=data.get('code', ''),
        name=data['name'],
        sector=data.get('sector'),
        current_price=data.get('current_price'),
        notes=data.get('notes'),
        logic_group_id=data.get('logic_group_id')
    )
    session.add(stock)
    session.commit()
    
    # Add field values
    field_values = data.get('field_values', {})
    for field_id, value in field_values.items():
        fv = StockFieldValue(stock_id=stock.id, custom_field_id=int(field_id), value=value)
        session.add(fv)
    session.commit()
    
    result = {
        'id': stock.id,
        'code': stock.code,
        'name': stock.name,
        'sector': stock.sector,
        'current_price': stock.current_price,
        'notes': stock.notes,
        'logic_group_id': stock.logic_group_id,
        'field_values': field_values,
        'created_at': stock.created_at.isoformat()
    }
    session.close()
    return jsonify(result), 201

@app.route('/api/stocks/<int:id>', methods=['PUT'])
def update_stock(id):
    data = request.json
    session = Session()
    stock = session.query(Stock).get(id)
    if stock:
        stock.code = data.get('code', stock.code)
        stock.name = data.get('name', stock.name)
        stock.sector = data.get('sector', stock.sector)
        stock.current_price = data.get('current_price', stock.current_price)
        stock.notes = data.get('notes', stock.notes)
        stock.logic_group_id = data.get('logic_group_id', stock.logic_group_id)
        
        # Update field values
        field_values = data.get('field_values', {})
        for field_id, value in field_values.items():
            existing = session.query(StockFieldValue).filter_by(stock_id=id, custom_field_id=int(field_id)).first()
            if existing:
                existing.value = value
            else:
                fv = StockFieldValue(stock_id=id, custom_field_id=int(field_id), value=value)
                session.add(fv)
        
        session.commit()
        result = {
            'id': stock.id,
            'code': stock.code,
            'name': stock.name,
            'sector': stock.sector,
            'current_price': stock.current_price,
            'notes': stock.notes,
            'logic_group_id': stock.logic_group_id,
            'field_values': field_values,
            'created_at': stock.created_at.isoformat()
        }
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/stocks/<int:id>', methods=['DELETE'])
def delete_stock(id):
    session = Session()
    stock = session.query(Stock).get(id)
    if stock:
        session.delete(stock)
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

# --- Trading Models ---
@app.route('/api/models', methods=['GET'])
def get_models():
    session = Session()
    models = session.query(TradingModel).order_by(TradingModel.updated_at.desc()).all()
    result = [{'id': m.id, 'name': m.name, 'description': m.description, 'drawing_data': m.drawing_data, 'created_at': m.created_at.isoformat(), 'updated_at': m.updated_at.isoformat()} for m in models]
    session.close()
    return jsonify(result)

@app.route('/api/models', methods=['POST'])
def create_model():
    data = request.json
    session = Session()
    model = TradingModel(
        name=data['name'],
        description=data.get('description', ''),
        drawing_data=data.get('drawing_data')
    )
    session.add(model)
    session.commit()
    result = {'id': model.id, 'name': model.name, 'description': model.description, 'drawing_data': model.drawing_data, 'created_at': model.created_at.isoformat(), 'updated_at': model.updated_at.isoformat()}
    session.close()
    return jsonify(result), 201

@app.route('/api/models/<int:id>', methods=['PUT'])
def update_model(id):
    data = request.json
    session = Session()
    model = session.query(TradingModel).get(id)
    if model:
        model.name = data.get('name', model.name)
        model.description = data.get('description', model.description)
        model.drawing_data = data.get('drawing_data', model.drawing_data)
        session.commit()
        result = {'id': model.id, 'name': model.name, 'description': model.description, 'drawing_data': model.drawing_data, 'created_at': model.created_at.isoformat(), 'updated_at': model.updated_at.isoformat()}
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/models/<int:id>', methods=['DELETE'])
def delete_model(id):
    session = Session()
    model = session.query(TradingModel).get(id)
    if model:
        session.delete(model)
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/models/<int:id>/drawing', methods=['GET'])
def get_model_drawing(id):
    session = Session()
    model = session.query(TradingModel).get(id)
    if model:
        result = {'drawing_data': model.drawing_data}
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/models/<int:id>/drawing', methods=['POST'])
def save_model_drawing(id):
    data = request.json
    session = Session()
    model = session.query(TradingModel).get(id)
    if model:
        model.drawing_data = data.get('drawing_data')
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

# --- Market Entries ---
@app.route('/api/market-entries', methods=['GET'])
def get_market_entries():
    session = Session()
    entries = session.query(MarketEntry).order_by(MarketEntry.created_at.desc()).all()
    result = [{
        'id': e.id,
        'title': e.title,
        'content': e.content,
        'category': e.category,
        'tags': e.tags or [],
        'created_at': e.created_at.isoformat(),
        'updated_at': e.updated_at.isoformat()
    } for e in entries]
    session.close()
    return jsonify(result)

@app.route('/api/market-entries', methods=['POST'])
def create_market_entry():
    data = request.json
    session = Session()
    entry = MarketEntry(
        title=data.get('title', data.get('content', '')),
        content=data.get('content', ''),
        category=data.get('category', 'index'),
        tags=data.get('tags', [])
    )
    session.add(entry)
    session.commit()
    result = {
        'id': entry.id,
        'title': entry.title,
        'content': entry.content,
        'category': entry.category,
        'tags': entry.tags or [],
        'created_at': entry.created_at.isoformat(),
        'updated_at': entry.updated_at.isoformat()
    }
    session.close()
    return jsonify(result), 201

@app.route('/api/market-entries/<int:id>', methods=['PUT'])
def update_market_entry(id):
    data = request.json
    session = Session()
    entry = session.query(MarketEntry).get(id)
    if entry:
        entry.title = data.get('title', entry.title)
        entry.content = data.get('content', entry.content)
        entry.category = data.get('category', entry.category)
        entry.tags = data.get('tags', entry.tags)
        session.commit()
        result = {
            'id': entry.id,
            'title': entry.title,
            'content': entry.content,
            'category': entry.category,
            'tags': entry.tags or [],
            'created_at': entry.created_at.isoformat(),
            'updated_at': entry.updated_at.isoformat()
        }
        session.close()
        return jsonify(result)
    session.close()
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/market-entries/<int:id>', methods=['DELETE'])
def delete_market_entry(id):
    session = Session()
    entry = session.query(MarketEntry).get(id)
    if entry:
        session.delete(entry)
        session.commit()
        session.close()
        return jsonify({'success': True})
    session.close()
    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
