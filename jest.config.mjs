export default {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: [".ts"],
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  }
};
