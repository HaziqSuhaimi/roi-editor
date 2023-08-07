const { exec } = require("child_process");
const watch = require("node-watch");

console.log("watching file changes...");
watch("./src", { recursive: true }, (evt, name) => {
  console.log(evt, name);
  exec("npm run build", { shell: false, windowsHide: true }, (error) => {
    if (error) {
      throw error;
    }
    console.log("dist updated");
  });
});
