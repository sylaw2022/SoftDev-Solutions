const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Add reporters directly in customJestConfig - this should work with next/jest
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/jest',
        outputName: 'junit.xml',
        suiteName: 'Jest Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true',
      },
    ],
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// The reporters need to be in customJestConfig for next/jest to properly merge them
// Remove reporters from customJestConfig since we'll add them after
delete customJestConfig.reporters

const baseConfig = createJestConfig(customJestConfig)

// Wrap the async config to ensure reporters are always included
module.exports = async () => {
  const config = await baseConfig()
  // Ensure reporters are included (createJestConfig might override them)
  // Use absolute path to avoid permission issues
  const outputDir = path.resolve(process.cwd(), 'test-results', 'jest')
  
  // Merge reporters, ensuring jest-junit is included
  const existingReporters = config.reporters || ['default']
  const hasJunitReporter = existingReporters.some(
    r => (Array.isArray(r) && r[0] === 'jest-junit') || r === 'jest-junit'
  )
  
  if (!hasJunitReporter) {
    config.reporters = [
      ...existingReporters,
      [
        'jest-junit',
        {
          outputDirectory: outputDir,
          outputName: 'junit.xml',
          suiteName: 'Jest Tests',
          classNameTemplate: '{classname}',
          titleTemplate: '{title}',
          ancestorSeparator: ' › ',
          usePathForSuiteName: 'true',
        },
      ],
    ]
  } else {
    // Update existing jest-junit reporter config
    config.reporters = existingReporters.map(r => {
      if (Array.isArray(r) && r[0] === 'jest-junit') {
        return [
          'jest-junit',
          {
            outputDirectory: outputDir,
            outputName: 'junit.xml',
            suiteName: 'Jest Tests',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: 'true',
            ...r[1], // Merge with existing config
          },
        ]
      }
      return r
    })
  }
  
  return config
}

