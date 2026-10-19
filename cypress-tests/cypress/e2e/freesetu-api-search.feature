Feature: FreeSetu service search API
  Scenario: Wait for API results before showing matching providers
    Given the FreeSetu search API returns a matching provider
    When I search FreeSetu for "dentist" near "Melbourne"
    Then the search should wait for the API request with "dentist" and "Melbourne"
    And I should see the provider "Bright Dental Clinic"