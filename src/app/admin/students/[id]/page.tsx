import React from 'react';
import StudentProfileClient from './StudentProfileClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminStudentProfilePage({ params }: Props) {
  const { id } = await params;
  return <StudentProfileClient studentId={id} />;
}
