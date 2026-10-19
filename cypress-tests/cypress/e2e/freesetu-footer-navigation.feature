Feature: FreeSetu footer service navigation
  Scenario: Open services from the footer
    Given I have opened the FreeSetu home page to test footer service navigation
    When I select Healthcare in the FreeSetu footer
    Then the services page should open from the footer