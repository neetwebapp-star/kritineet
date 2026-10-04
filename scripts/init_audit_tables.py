import sqlite3

def init_audit_tables():
    conn = sqlite3.connect('prisma/dev.db')
    c = conn.cursor()

    # Table for storing audit runs / sessions
    c.execute('''
    CREATE TABLE IF NOT EXISTS NCERTAuditRun (
        id TEXT PRIMARY KEY,
        createdAt TEXT NOT NULL,
        completedAt TEXT,
        status TEXT NOT NULL, -- IN_PROGRESS | COMPLETED | FAILED | INCOMPLETE
        targetClass TEXT NOT NULL DEFAULT 'Class 11',
        targetSubject TEXT NOT NULL DEFAULT 'Physics',
        targetBook TEXT NOT NULL DEFAULT 'Book 1 / Part 1',
        totalChapters INTEGER DEFAULT 0,
        auditedChapters INTEGER DEFAULT 0,
        totalSections INTEGER DEFAULT 0,
        auditedSections INTEGER DEFAULT 0,
        totalTopics INTEGER DEFAULT 0,
        auditedTopics INTEGER DEFAULT 0,
        totalBlocks INTEGER DEFAULT 0,
        auditedBlocks INTEGER DEFAULT 0,
        totalFigures INTEGER DEFAULT 0,
        auditedFigures INTEGER DEFAULT 0,
        totalTables INTEGER DEFAULT 0,
        auditedTables INTEGER DEFAULT 0,
        totalFormulas INTEGER DEFAULT 0,
        auditedFormulas INTEGER DEFAULT 0,
        criticalCount INTEGER DEFAULT 0,
        warningCount INTEGER DEFAULT 0,
        infoCount INTEGER DEFAULT 0,
        passCount INTEGER DEFAULT 0,
        currentStage TEXT DEFAULT 'INITIALIZING',
        currentProgress TEXT DEFAULT '0%',
        checkpointChapter INTEGER DEFAULT 1,
        errorMessage TEXT,
        summaryJson TEXT
    )
    ''')

    # Table for storing individual audit issues / verification results
    c.execute('''
    CREATE TABLE IF NOT EXISTS NCERTAuditIssue (
        id TEXT PRIMARY KEY,
        auditRunId TEXT NOT NULL,
        severity TEXT NOT NULL, -- CRITICAL | WARNING | INFO | PASS
        issueType TEXT NOT NULL,
        className TEXT NOT NULL DEFAULT 'Class 11',
        subjectName TEXT NOT NULL DEFAULT 'Physics',
        bookCode TEXT NOT NULL DEFAULT 'keph101',
        chapterNumber INTEGER NOT NULL,
        chapterTitle TEXT NOT NULL,
        sectionNumber TEXT,
        topicNumber TEXT,
        sourcePage INTEGER,
        sourceBlockId TEXT,
        appRecordId TEXT,
        sourceContent TEXT,
        appContent TEXT,
        detectedDifference TEXT,
        confidence REAL DEFAULT 1.0,
        recommendedAction TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(auditRunId) REFERENCES NCERTAuditRun(id) ON DELETE CASCADE
    )
    ''')

    # Indexes for fast lookup
    c.execute('CREATE INDEX IF NOT EXISTS idx_audit_run_id ON NCERTAuditIssue(auditRunId)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_audit_severity ON NCERTAuditIssue(severity)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_audit_chapter ON NCERTAuditIssue(chapterNumber)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_audit_type ON NCERTAuditIssue(issueType)')

    conn.commit()
    conn.close()
    print("Audit tables successfully initialized in prisma/dev.db")

if __name__ == '__main__':
    init_audit_tables()
