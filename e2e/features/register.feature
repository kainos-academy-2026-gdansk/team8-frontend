Feature: Account registration
  As a prospective applicant
  I want to create an account
  So that I can sign in and apply for job roles

  Background:
    Given I am on the registration page

  Scenario: The registration page loads successfully
    Then the registration page should respond with status 200
    And I should see the registration form

  Scenario: Submitting the form with every field empty
    When I submit the registration form with no details
    Then I should see validation errors for email, password and confirm password

  Scenario: Submitting an invalid email format
    When I register with an invalid email format
    Then I should see an email format error

  Scenario: Submitting a password that is too weak
    When I register with a weak password
    Then I should see a password strength error

  Scenario: Mismatched passwords are rejected by the UI and the API
    When I register with mismatched passwords
    Then I should see a passwords must match error
    And the registration request should respond with status 400

  Scenario: The submitted email is kept but passwords are cleared after an error
    When I register with mismatched passwords
    Then the email field should keep my submitted value
    And the password fields should be empty

  Scenario: Following the link back to sign in
    When I follow the link to sign in
    Then I should be on the login page
