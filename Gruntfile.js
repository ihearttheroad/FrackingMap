'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    connect: {
      server: {
        options: {
          base: '',
          port: 9000,
          open: true,
          keepalive: true
        }
      }
    }
  });

  grunt.registerTask('serve', [
    'connect:server'
  ]);

  grunt.registerTask('default', ['serve']);
};
