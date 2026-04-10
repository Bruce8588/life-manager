#!/usr/bin/env python3
"""
每天早上8点发送前一天的饮食汇总邮件
"""
import sys
import os

# 添加项目路径
sys.path.insert(0, '/root/diet-tracker')

# 临时修改配置，让邮件发送给所有注册用户
import sqlite3
DATABASE = '/root/diet-tracker/diet_tracker.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def send_yesterday_digest():
    """发送前一天的饮食汇总"""
    from datetime import date, timedelta
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    yesterday = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    conn = get_db()
    cursor = conn.cursor()
    
    # 获取前一天所有用户的记录
    cursor.execute('''
        SELECT r.*, u.username, u.email 
        FROM food_records r 
        JOIN users u ON r.user_id = u.id
        WHERE date(r.created_at) = ?
        ORDER BY u.username, r.created_at
    ''', (yesterday,))
    records = cursor.fetchall()
    
    if not records:
        print(f"{yesterday} 没有饮食记录，跳过发送")
        conn.close()
        return
    
    # 获取所有用户邮箱
    cursor.execute('SELECT username, email FROM users')
    all_users = {row['username']: row['email'] for row in cursor.fetchall()}
    conn.close()
    
    # 按用户分组
    by_user = {}
    for r in records:
        user = r['username']
        if user not in by_user:
            by_user[user] = []
        by_user[user].append(dict(r))
    
    # 构建邮件内容
    prev_date = (date.today() - timedelta(days=1))
    date_str = prev_date.strftime('%Y年%m月%d日')
    
    html_content = f"""
    <html><head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
            .header p {{ margin: 8px 0 0; opacity: 0.9; font-size: 14px; }}
            .content {{ padding: 24px; }}
            .stats {{ display: flex; gap: 16px; margin-bottom: 24px; }}
            .stat {{ flex: 1; background: #fafafa; padding: 16px; border-radius: 12px; text-align: center; }}
            .stat-num {{ font-size: 28px; font-weight: 700; color: #FF6B6B; }}
            .stat-label {{ font-size: 12px; color: #666; margin-top: 4px; }}
            .user-section {{ margin-bottom: 24px; border-left: 3px solid #FF6B6B; padding-left: 16px; }}
            .user-name {{ font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px; }}
            .record {{ display: flex; gap: 12px; padding: 16px; background: #fafafa; border-radius: 12px; margin-bottom: 12px; }}
            .record-img {{ width: 64px; height: 64px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 28px; }}
            .record-info {{ flex: 1; }}
            .record-name {{ font-weight: 600; font-size: 16px; color: #333; margin-bottom: 4px; }}
            .record-meta {{ font-size: 13px; color: #999; }}
            .category {{ display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }}
            .category-breakfast {{ background: #FFF3E0; color: #FF9800; }}
            .category-lunch {{ background: #E8F5E9; color: #4CAF50; }}
            .category-dinner {{ background: #E3F2FD; color: #2196F3; }}
            .category-snack {{ background: #FCE4EC; color: #E91E63; }}
            .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
            .motivation {{ background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%); padding: 16px; border-radius: 12px; margin-top: 20px; text-align: center; color: #FF6B6B; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍽️ {date_str} 饮食汇报</h1>
                <p>来看看昨天的饮食情况吧～</p>
            </div>
            <div class="content">
                <div class="stats">
                    <div class="stat">
                        <div class="stat-num">{len(records)}</div>
                        <div class="stat-label">总记录</div>
                    </div>
                    <div class="stat">
                        <div class="stat-num">{len(by_user)}</div>
                        <div class="stat-label">参与者</div>
                    </div>
                </div>
    """
    
    for user_name, user_records in by_user.items():
        html_content += f'<div class="user-section"><div class="user-name">👤 {user_name}</div>'
        for r in user_records:
            cat_class = f'category-{r["category"]}'
            cat_text = {'breakfast': '🌅 早餐', 'lunch': '☀️ 午餐', 'dinner': '🌙 晚餐', 'snack': '🍰 零食'}.get(r['category'], '🍽️ 其他')
            time_str = r['created_at'].split(' ')[1][:5] if ' ' in r['created_at'] else ''
            
            html_content += f"""
                <div class="record">
                    <div class="record-img">🍽️</div>
                    <div class="record-info">
                        <div class="record-name">{r['food_name']}</div>
                        <div class="record-meta">
                            <span class="category {cat_class}">{cat_text}</span>
                            <span>{time_str}</span>
                        </div>
                        {f'<div style="margin-top: 4px; font-size: 13px; color: #666;">📝 {r["notes"]}</div>' if r['notes'] else ''}
                    </div>
                </div>
            """
        html_content += '</div>'
    
    html_content += f"""
                <div class="motivation">💪 互相监督，保持健康饮食习惯！</div>
            </div>
            <div class="footer">饮食记录网站 · {date_str}</div>
        </div>
    </body>
    </html>
    """
    
    # 邮件配置
    EMAIL_CONFIG = {
        'smtp_server': 'smtp.qq.com',
        'smtp_port': 587,
        'sender_email': '1299960857@qq.com',
        'sender_password': 'yckyfmrldseajfgi',
    }
    
    # 发送给所有用户
    try:
        with smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port']) as server:
            server.starttls()
            server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
            
            sent = 0
            for user_name, user_email in all_users.items():
                msg = MIMEMultipart('related')
                msg['Subject'] = f"🍽️ {date_str} 饮食汇报 | {len(records)}条记录 · {len(by_user)}人参与"
                msg['From'] = EMAIL_CONFIG['sender_email']
                msg['To'] = user_email
                msg.attach(MIMEText(html_content, 'html', 'utf-8'))
                server.send_message(msg)
                sent += 1
            
            print(f"✅ 成功发送给 {sent} 位用户 ({yesterday} 的饮食汇报)")
    except Exception as e:
        print(f"❌ 发送失败: {e}")

if __name__ == '__main__':
    send_yesterday_digest()
