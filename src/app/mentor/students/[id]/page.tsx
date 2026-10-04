import React from 'react';
import MentorStudentClient from './MentorStudentClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MentorStudentPage({ params }: Props) {
  const { id } = await params;
  return <MentorStudentClient studentId={id} />;
}
