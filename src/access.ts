export default function access(
  initialState:
    | {
        currentUser?: {
          rol?: string;
        };
      }
    | undefined,
) {
  const { currentUser } = initialState ?? {};

  return {
    canAdmin: currentUser?.rol === 'admin',
    canUser:
      Boolean(currentUser) &&
      currentUser?.rol !== 'admin',
  };
}
