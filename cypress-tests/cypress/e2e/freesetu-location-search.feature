Feature: FreeSetu location search
  Scenario: Enter a location for consultation discovery
    Given I have opened the FreeSetu home page for location lookup
    When I enter "Melbourne" in the FreeSetu location search
    Then the FreeSetu location search should show "Melbourne"