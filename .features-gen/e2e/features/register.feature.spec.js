// Generated from: e2e/features/register.feature
import { test } from "../../../e2e/fixtures/testFixtures.ts";

test.describe('Account registration', () => {

  test.beforeEach('Background', async ({ Given, lastResponse, registerPage }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the registration page', null, { lastResponse, registerPage }); 
  });
  
  test('The registration page loads successfully', async ({ Then, And, lastResponse, registerPage }) => { 
    await Then('the registration page should respond with status 200', null, { lastResponse }); 
    await And('I should see the registration form', null, { registerPage }); 
  });

  test('Submitting the form with every field empty', async ({ When, Then, registerPage }) => { 
    await When('I submit the registration form with no details', null, { registerPage }); 
    await Then('I should see validation errors for email, password and confirm password', null, { registerPage }); 
  });

  test('Submitting an invalid email format', async ({ When, Then, registerPage }) => { 
    await When('I register with an invalid email format', null, { registerPage }); 
    await Then('I should see an email format error', null, { registerPage }); 
  });

  test('Submitting a password that is too weak', async ({ When, Then, registerPage }) => { 
    await When('I register with a weak password', null, { registerPage }); 
    await Then('I should see a password strength error', null, { registerPage }); 
  });

  test('Mismatched passwords are rejected by the UI and the API', async ({ When, Then, And, lastResponse, page, registerPage }) => { 
    await When('I register with mismatched passwords', null, { lastResponse, page, registerPage }); 
    await Then('I should see a passwords must match error', null, { registerPage }); 
    await And('the registration request should respond with status 400', null, { lastResponse }); 
  });

  test('The submitted email is kept but passwords are cleared after an error', async ({ When, Then, And, lastResponse, page, registerPage }) => { 
    await When('I register with mismatched passwords', null, { lastResponse, page, registerPage }); 
    await Then('the email field should keep my submitted value', null, { registerPage }); 
    await And('the password fields should be empty', null, { registerPage }); 
  });

  test('Following the link back to sign in', async ({ When, Then, page, registerPage }) => { 
    await When('I follow the link to sign in', null, { registerPage }); 
    await Then('I should be on the login page', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/register.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the registration page should respond with status 200","stepMatchArguments":[{"group":{"start":49,"value":"200"},"parameterTypeName":"int"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And I should see the registration form","stepMatchArguments":[]}]},
  {"pwTestLine":15,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I submit the registration form with no details","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then I should see validation errors for email, password and confirm password","stepMatchArguments":[]}]},
  {"pwTestLine":20,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I register with an invalid email format","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then I should see an email format error","stepMatchArguments":[]}]},
  {"pwTestLine":25,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I register with a weak password","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then I should see a password strength error","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":25,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When I register with mismatched passwords","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then I should see a passwords must match error","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"And the registration request should respond with status 400","stepMatchArguments":[{"group":{"start":52,"value":"400"},"parameterTypeName":"int"}]}]},
  {"pwTestLine":36,"pickleLine":30,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When I register with mismatched passwords","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then the email field should keep my submitted value","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And the password fields should be empty","stepMatchArguments":[]}]},
  {"pwTestLine":42,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I follow the link to sign in","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then I should be on the login page","stepMatchArguments":[]}]},
]; // bdd-data-end