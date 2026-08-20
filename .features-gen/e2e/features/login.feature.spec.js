// Generated from: e2e/features/login.feature
import { test } from "../../../e2e/fixtures/testFixtures.ts";

test.describe('User sign in', () => {

  test.beforeEach('Background', async ({ Given, lastResponse, loginPage }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the login page', null, { lastResponse, loginPage }); 
  });
  
  test('The sign-in form is available', async ({ Then, loginPage }) => { 
    await Then('I should see the sign-in form', null, { loginPage }); 
  });

  test('Signing in without an email is rejected by the UI and the API', async ({ When, Then, And, lastResponse, loginPage, page }) => { 
    await When('I sign in without an email', null, { lastResponse, loginPage, page }); 
    await Then('I should see a "both fields required" error', null, { loginPage }); 
    await And('the login request should respond with status 400', null, { lastResponse }); 
  });

  test('Signing in without a password is rejected by the UI and the API', async ({ When, Then, And, lastResponse, loginPage, page }) => { 
    await When('I sign in without a password', null, { lastResponse, loginPage, page }); 
    await Then('I should see a "both fields required" error', null, { loginPage }); 
    await And('the login request should respond with status 400', null, { lastResponse }); 
  });

  test('Submitting an empty form is rejected by the UI and the API', async ({ When, Then, And, lastResponse, loginPage, page }) => { 
    await When('I sign in with no details', null, { lastResponse, loginPage, page }); 
    await Then('I should see a "both fields required" error', null, { loginPage }); 
    await And('the login request should respond with status 400', null, { lastResponse }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the sign-in form","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I sign in without an email","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then I should see a \"both fields required\" error","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And the login request should respond with status 400","stepMatchArguments":[{"group":{"start":45,"value":"400"},"parameterTypeName":"int"}]}]},
  {"pwTestLine":20,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I sign in without a password","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then I should see a \"both fields required\" error","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And the login request should respond with status 400","stepMatchArguments":[{"group":{"start":45,"value":"400"},"parameterTypeName":"int"}]}]},
  {"pwTestLine":26,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I sign in with no details","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should see a \"both fields required\" error","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"And the login request should respond with status 400","stepMatchArguments":[{"group":{"start":45,"value":"400"},"parameterTypeName":"int"}]}]},
]; // bdd-data-end