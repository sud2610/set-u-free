Feature: FreeSetu footer contact navigation
  Scenario: Open contact details from the footer
    Given I have opened the FreeSetu home page to test footer contact navigation
    When I select Contact in the FreeSetu company footer
    Then the contact page should show email and phone details