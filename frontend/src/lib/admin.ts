// Centralized admin emails for RBAC
const ADMIN_EMAILS = [
    'kurtgavin.design@gmail.com',
    'nicolemaaba@gmail.com',
    'agpfrancisco1@gmail.com',
];

export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
