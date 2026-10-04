import { NextRequest, NextResponse } from 'next/server';
import { authorizeStudentAccess } from '@/lib/command-center/auth-utils';
import { ReportingEngine } from '@/lib/command-center/reporting-engine';
import { RbacEngine } from '@/lib/command-center/rbac-engine';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const auth = await authorizeStudentAccess(req, id, 'STUDENT_VIEW');

    if (!auth.allowed) {
      return NextResponse.json({ error: auth.reason || 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const compareDays = parseInt(searchParams.get('compareDays') || '7', 10);

    const [rawReport, periodComparison] = await Promise.all([
      ReportingEngine.generateReport(id),
      ReportingEngine.comparePeriods(id, compareDays),
    ]);

    // Parent privacy filter
    const isParent = auth.actor.role === 'PARENT';
    const report = isParent ? RbacEngine.filterDataForParent(rawReport) : rawReport;

    if (format === 'csv') {
      const csv = ReportingEngine.generateCsv(rawReport, isParent);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="neet2027_student_report_${id.slice(-6)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      report,
      periodComparison,
      accessLevel: auth.accessLevel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
