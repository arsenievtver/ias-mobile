export const PREFIX = 'https://ins-front.ddns.net/api/v1';
export const JWT_STORAGE_KEY = 'jwt_token';

export const loginUrl = '/auth/jwt/login';
export const ModulesGetUrl = (instructionId) => `/training_modules/get_modules_for_user_instruction/${instructionId}`;
export const ModulesUpdatePostUrl = (moduleId) => `/training_modules/set_module_status?module_id=${moduleId}&is_completed=true`;
export const InstructionValidPatchUrl = (instructionId) => `/journals/update_journal/${instructionId}`;
export const TestListGetUrl = (instructionId) => `/tests/get_tests_instruction/${instructionId}`;
export const TestGetUrl = (testId) => `/tests/tests/${testId}`;