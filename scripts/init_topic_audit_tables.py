import sqlite3

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

# Table for Audit Runs
cur.execute("""
CREATE TABLE IF NOT EXISTS MTGTopicAuditRun (
    id TEXT PRIMARY KEY,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,
    totalChapters INTEGER NOT NULL,
    totalTopics INTEGER NOT NULL,
    totalSourceMCQs INTEGER NOT NULL,
    totalAppMCQs INTEGER NOT NULL,
    totalMatched INTEGER NOT NULL,
    totalMissing INTEGER NOT NULL,
    totalExtra INTEGER NOT NULL,
    totalMisplaced INTEGER NOT NULL,
    totalDuplicates INTEGER NOT NULL,
    totalContentMismatch INTEGER NOT NULL,
    totalBroken INTEGER NOT NULL,
    totalUnverified INTEGER NOT NULL,
    topicsVerified INTEGER NOT NULL,
    topicsFailed INTEGER NOT NULL,
    chaptersVerified INTEGER NOT NULL,
    chaptersFailed INTEGER NOT NULL,
    globalParityRate REAL NOT NULL,
    globalVerificationRate REAL NOT NULL,
    summaryJson TEXT
)
""")

# Table for Topic-by-Topic Reconciliation Records
cur.execute("""
CREATE TABLE IF NOT EXISTS MTGTopicAuditItem (
    id TEXT PRIMARY KEY,
    auditRunId TEXT NOT NULL,
    subject TEXT NOT NULL,
    classLevel TEXT NOT NULL,
    chapterId TEXT NOT NULL,
    chapterNumber INTEGER NOT NULL,
    chapterTitle TEXT NOT NULL,
    topicId TEXT,
    topicNumber TEXT NOT NULL,
    topicTitle TEXT NOT NULL,
    subtopic TEXT,
    sourceMcqCount INTEGER NOT NULL,
    appMcqCount INTEGER NOT NULL,
    matchedCount INTEGER NOT NULL,
    missingCount INTEGER NOT NULL,
    extraCount INTEGER NOT NULL,
    misplacedCount INTEGER NOT NULL,
    duplicateCount INTEGER NOT NULL,
    contentMismatchCount INTEGER NOT NULL,
    brokenCount INTEGER NOT NULL,
    unverifiedCount INTEGER NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (auditRunId) REFERENCES MTGTopicAuditRun(id)
)
""")

# Table for MCQ-level Evidence
cur.execute("""
CREATE TABLE IF NOT EXISTS MTGTopicAuditEvidence (
    id TEXT PRIMARY KEY,
    auditRunId TEXT NOT NULL,
    topicAuditItemId TEXT NOT NULL,
    chapterTitle TEXT NOT NULL,
    sourceQuestionNumber TEXT,
    sourcePage INTEGER,
    sourceIdentityHash TEXT,
    appQuestionId TEXT,
    appIdentityHash TEXT,
    canonicalSourceTopic TEXT NOT NULL,
    currentAppTopic TEXT,
    mismatchType TEXT NOT NULL,
    evidence TEXT NOT NULL,
    FOREIGN KEY (auditRunId) REFERENCES MTGTopicAuditRun(id)
)
""")

cur.execute("CREATE INDEX IF NOT EXISTS idx_mtg_audit_item_run ON MTGTopicAuditItem(auditRunId)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_mtg_audit_item_status ON MTGTopicAuditItem(status)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_mtg_audit_ev_item ON MTGTopicAuditEvidence(topicAuditItemId)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_mtg_audit_ev_type ON MTGTopicAuditEvidence(mismatchType)")

conn.commit()
conn.close()
print("MTG Topic Audit database tables initialized successfully.")
