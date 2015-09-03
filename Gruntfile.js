module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-modify-json');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-connect');

  //update broken bootstrap bower.json
  grunt.registerMultiTask("updatebootstrap", "Fixes bootstrap's bower.json", function() {
    var bootBower = "bower_components/bootstrap/bower.json";
    if (!grunt.file.exists(bootBower)) {
      grunt.log.error("file " + bootBower + " not found");
      return true;
    }

    var bower = grunt.file.readJSON(bootBower);
    bower["main"] = ["dist/css/bootstrap.css", "dist/js/bootstrap.js"]
    grunt.file.write(bootBower, JSON.stringify(bower, null, 2));
  });

  grunt.initConfig({
    bower: {
      install: {
         options: {
           targetDir: "./bower_components",
           install: true
         }
      }
    },
    updatebootstrap: {
      target: {}
    },
    wiredep: {
      target: {
        src: 'index.html' // point to your HTML file.
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          keepalive: true
        }
      }
    }
  });



  grunt.registerTask('default', ['bower', 'updatebootstrap', 'wiredep', 'connect']);
}
