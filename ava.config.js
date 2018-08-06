export default {
    files: [
        "**/__tests__/**/*.spec.ts"
    ],
    sources: [
        "src/**/*.ts"
    ],
    extensions: ['ts'],
    require: [
        'ts-node/register/transpile-only'
    ]
}