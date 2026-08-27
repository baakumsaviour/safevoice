export type TesterRole = 'admin' | 'caseworker' | 'analyst' | 'victim'
export type TesterAccount = { email: string; fullName: string; role: TesterRole }
export const TESTER_PASSWORD: string
export const TESTER_ACCOUNTS: TesterAccount[]
