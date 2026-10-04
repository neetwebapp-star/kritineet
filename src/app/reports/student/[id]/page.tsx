import React from 'react';
import StudentReportClient from './StudentReportClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentReportPage({ params }: Props) {
  const { id } = await params;
  return <StudentReportClient studentId={id} />;
}
