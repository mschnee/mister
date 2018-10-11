export default {
    files: [
        "**/__tests__/**/*.spec.ts"
    ],
    sources: [
        "src/**/*.ts"
    ],
    cache: true,
    compileEnhancements: false,
    extensions: ['ts'],
    require: [
        'ts-node/register'
    ]
}
