// Generated from: e2e/features/register.feature
import { test } from "../../../e2e/bdd/fixtures.ts";

test.describe('Registration page', () => {

  test('Registration form is available', async ({ Given, Then, And, world }) => { 
    await Given('I am on the registration page', null, { world }); 
    await Then('I can see the registration form', null, { world }); 
    await And('the password fields are hidden', null, { world }); 
    await And('the create account button is enabled', null, { world }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/register.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I can see the registration form","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the password fields are hidden","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And the create account button is enabled","stepMatchArguments":[]}]},
]; // bdd-data-end