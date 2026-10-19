Feature: FreeSetu customer website
  As a visitor
  I want to explore FreeSetu
  So that I can find services and access account pages

  Scenario: View the home page and service categories
    Given I open the FreeSetu home page
    Then I see the free consultation heading
    And I see the Dentist service category

  Scenario: Enter a service search
    Given I open the FreeSetu home page
    When I search for "dentist"
    Then the service search contains "dentist"

  Scenario Outline: Navigate to an informational page
    Given I open the FreeSetu home page
    When I choose "<link>" from the navigation
    Then I see the "<heading>" page heading

    Examples:
      | link     | heading          |
      | Services | Our Services     |
      | About    | About Set-U-Free |
      | Contact  | Contact Us       |

  Scenario: Open the sign-in page
    Given I open the FreeSetu home page
    When I choose "Sign In" from the account links
    Then I see the "Sign In to Set-U-Free" page heading
    And I see the email and password fields

  Scenario: Open the join page
    Given I open the FreeSetu home page
    When I choose "Join Free" from the account links
    Then I see the "Join Set-U-Free" page heading
    And I see the full name, email, and password fields

  Scenario: Enter a contact message
    Given I open the FreeSetu home page
    When I choose "Contact" from the navigation
    And I enter contact details
    Then the contact form contains my details