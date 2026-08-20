Feature: Registration
  As a new user
  I want to create an account
  So that I can sign in to the application

  Scenario: User is able to register an account
    Given I am on the registration page
    When I register using valid details
    Then an account is successfully created
