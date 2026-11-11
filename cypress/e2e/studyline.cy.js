describe("Studyline release workflow", () => {
  it("registers, completes assignment CRUD, then updates and deletes the profile", () => {
    const email = `release-${Date.now()}@example.test`;
    const password = "Studyline-demo-password-229";
    cy.visit("/");
    cy.contains("button", "Create an account").click();
    cy.get('input[name="name"]').type("Demo Student");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password, { log: false });
    cy.contains("button", "Create account").click();
    cy.contains("h1", "Your work, in focus.").should("be.visible");

    cy.contains("button", "New assignment").click();
    cy.contains("label", "Assignment title")
      .find("input")
      .type("Part 2 demonstration");
    cy.contains("label", /^Course$/)
      .find("input")
      .type("COMP229");
    cy.contains("label", "Due date").find("input").clear().type("2026-12-03");
    cy.contains("button", /^Add assignment$/).click();
    cy.contains("h3", "Part 2 demonstration").should("be.visible");
    cy.get('[aria-label="Edit Part 2 demonstration"]').click();
    cy.contains("label", "Assignment title")
      .find("input")
      .clear()
      .type("Part 2 verified");
    cy.contains("button", "Save changes").click();
    cy.contains("h3", "Part 2 verified").should("be.visible");
    cy.screenshot("assignment-edit-passed");
    cy.get('[aria-label="Delete Part 2 verified"]').click();
    cy.contains("button", /^Delete assignment$/).click();
    cy.contains("h3", "Part 2 verified").should("not.exist");

    cy.contains("button", "My profile")
      .click()
      .should("have.attr", "aria-current", "page");
    cy.get('input[name="name"]').clear().type("Updated Student");
    cy.contains("button", "Save profile").click();
    cy.contains('[role="status"]', "Profile saved.").should("be.visible");
    cy.screenshot("profile-update-passed");
    cy.contains("button", "Delete my account").click();
    cy.get('input[name="password"]').type(password, { log: false });
    cy.contains("button", "Permanently delete account").click();
    cy.contains("h2", "Welcome back.").should("be.visible");
  });
});
