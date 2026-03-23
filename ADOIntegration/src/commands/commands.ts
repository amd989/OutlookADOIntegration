Office.onReady(() => {
  Office.actions.associate("showTaskpane", () => {
    return Office.addin
      .showAsTaskpane()
      .then(() => {})
      .catch((error: Error) => {
        console.error("Failed to show taskpane:", error);
      });
  });
});
