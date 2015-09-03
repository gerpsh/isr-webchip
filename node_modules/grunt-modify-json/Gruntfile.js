/*
 * grunt-modify-json
 * https://github.com/aarongloege/grunt-modify-json
 *
 * Copyright (c) 2014 Aaron Gloege
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

      modify_json: {
          file: {
              expand: true,
              cwd: 'test/',
              src: ['*.json'],
              options: {
                  add: true,
                  fields: {
                      "test": 11435,
                      "width": 143
                  }
              }
          }
      }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

};
