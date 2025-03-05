// node_modules/@here/hds-icon/build/hds-icon.js checks for fonts that have been loaded in document object
// and tries to iterate over the same. Since this is a headless test env, this value needs to be mocked.
// temporary work around until hds fixes the same.
Object.defineProperty(document, "fonts", {
  value: [],
});
