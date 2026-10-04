import sqlite3
from datetime import date, timedelta

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

START_DATE = date(2026, 10, 5)
END_DATE = date(2027, 5, 5)
TOTAL_DAYS = (END_DATE - START_DATE).days + 1

cur.execute("""
    SELECT t.id, t.topicNumber, t.title, c.id, c.chapterNumber, c.title, c.slug, s.name, cl.code
    FROM Topic t
    JOIN Chapter c ON t.chapterId = c.id
    JOIN Subject s ON c.subjectId = s.id
    JOIN ClassLevel cl ON s.classLevelId = cl.id
    ORDER BY cl.code ASC, s.name ASC, c.chapterNumber ASC, t.orderIndex ASC
""")
all_topics = cur.fetchall()
print(f"Total topics in DB: {len(all_topics)}")

topic_queue = list(all_topics)
scheduled_ids = set()
spaced_queue = {} # date_str -> list

overloaded_count = 0
min_mins = 9999
max_mins = 0
total_mins = 0

current = START_DATE
for day_idx in range(1, TOTAL_DAYS + 1):
    date_str = current.strftime("%Y-%m-%d")
    current += timedelta(days=1)
    
    is_half_book = day_idx in [35, 70, 110, 145]
    is_sunday = (day_idx % 7 == 0)
    is_mock = (day_idx >= 146 and day_idx <= 185 and day_idx % 6 == 0)
    is_final_7 = (day_idx >= 207)
    
    day_mins = 0
    
    # 1. Spaced Repetition (Max 2 reviews per day = 70m, or 1 on test days = 35m)
    due = spaced_queue.get(date_str, [])
    max_revs = 1 if (is_half_book or is_mock) else 2
    actual_revs = due[:max_revs]
    # Carry forward leftover due reviews
    if len(due) > max_revs:
        next_day = (current).strftime("%Y-%m-%d")
        if next_day not in spaced_queue:
            spaced_queue[next_day] = []
        spaced_queue[next_day].extend(due[max_revs:])
        
    for _ in actual_revs:
        day_mins += 35
        
    # 2. Topic Coverage
    if day_idx <= 145 and topic_queue:
        if is_half_book:
            topics_today = 0 # pure milestone test day
        elif is_sunday:
            topics_today = 1
        else:
            topics_today = 3
            if len(topic_queue) > (145 - day_idx) * 3:
                topics_today = 4
                
        for _ in range(topics_today):
            if topic_queue:
                t = topic_queue.pop(0)
                scheduled_ids.add(t[0])
                day_mins += 75 # 40m NCERT + 35m FT
                
                # Add spaced repetition for R1(+2d), R2(+3d), R3(+5d), R4(+7d), R5(+14d)
                for off, code in [(2, 'R1'), (3, 'R2'), (5, 'R3'), (7, 'R4'), (14, 'R5')]:
                    target = day_idx + off
                    if target <= TOTAL_DAYS:
                        t_d = (START_DATE + timedelta(days=target-1)).strftime("%Y-%m-%d")
                        if t_d not in spaced_queue:
                            spaced_queue[t_d] = []
                        spaced_queue[t_d].append(t[0])
                        
        # PYQ
        if not is_half_book and not is_sunday:
            day_mins += 40
            
    # 3. Tests
    if is_half_book:
        day_mins += 120
    elif is_sunday and day_idx <= 145:
        day_mins += 90
    elif is_mock:
        day_mins += 200 + 90 # Mock 200m + Analysis 90m
    elif day_idx >= 146 and day_idx <= 185:
        day_mins += 120 + 90 # Mixed revision 120m + NCERT reread 90m
    elif day_idx >= 186:
        if is_final_7:
            day_mins += 90 + 90 + 60 # Formulas 90m + Error book 90m + Diagrams 60m
        else:
            day_mins += 120 + 60 # Unit synthesis 120m + 5-yr PYQs 60m
            
    # 4. Buffer
    buffer_mins = max(30, 540 - day_mins) if day_mins < 540 else max(0, 600 - day_mins)
    day_mins += buffer_mins
    
    if day_mins > 600:
        overloaded_count += 1
    total_mins += day_mins
    if day_mins > max_mins: max_mins = day_mins
    if day_mins < min_mins: min_mins = day_mins

print("--- SIMULATION RESULT ---")
print(f"Total topics scheduled: {len(scheduled_ids)} / {len(all_topics)} (Left in queue: {len(topic_queue)})")
print(f"Total scheduled hours: {total_mins / 60:.1f}h")
print(f"Average daily hours: {total_mins / (TOTAL_DAYS * 60):.2f}h")
print(f"Min daily hours: {min_mins / 60:.2f}h | Max daily hours: {max_mins / 60:.2f}h")
print(f"Overloaded days (> 600m): {overloaded_count}")
