Feature: User sign in
  As a registered user
  I want to sign in with my email and password
  So that I can access the job roles I'm eligible for

  Background:
    Given I am on the login page

  Scenario: The sign-in form is available
    Then I should see the sign-in form

  Scenario: Signing in without an email is rejected by the UI and the API
    When I sign in without an email
    Then I should see a "both fields required" error
    And the login request should respond with status 400

  Scenario: Signing in without a password is rejected by the UI and the API
    When I sign in without a password
    Then I should see a "both fields required" error
    And the login request should respond with status 400

  Scenario: Submitting an empty form is rejected by the UI and the API
    When I sign in with no details
    Then I should see a "both fields required" error
    And the login request should respond with status 400
