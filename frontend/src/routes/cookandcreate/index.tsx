import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/cookandcreate/')({
  component: () => <Navigate to="/cookandcreate/lobby" />,
});
