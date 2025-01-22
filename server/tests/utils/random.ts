import { Chance } from 'chance'
import config from '@server/config'

// Chance is a lightweight fake data generator.
// Faker.js is another popular library, but it is relatively slow to import.
// Also, if we are running tests in CI server, we want to use the same seed
// every time to make the tests deterministic.
export const random = config.isCi ? Chance(1) : Chance()

// Deterministic Tests:
// A deterministic test is one that produces the same results every time it's run, given the same input conditions. In the context of this code:

// Consistency: Using a fixed seed (Chance(1)) in CI ensures that random data generated is always the same.
// Reproducibility: This allows for consistent test results across different runs and environments.
// Debugging: If a test fails in CI, developers can reproduce the exact conditions locally.
// Avoiding Flaky Tests: Deterministic tests help prevent "flaky" tests that sometimes pass and sometimes fail due to randomness.