'use strict';


module.exports = function(grunt) {

  grunt.option('stack', true);

  require('time-grunt')(grunt);

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      target: [
        '*.js',
        'test/acceptance/*.js',
        'test/server/*.js',
        'bin/mysiteWWW',
        'helpers/*.js',
        'routes/*.js'
      ]
    },

    mochacov: {
      coverage: {
        options: {
          reporter: 'mocha-term-cov-reporter',
          coverage: true
        }
      },
      coveralls: {
        options: {
          coveralls: {
            serviceName: 'travis-ci'
          }
        }
      },
      unit: {
        options: {
          reporter: 'spec',
          require: ['chai']
        }
      },
      html: {
        options: {
          reporter: 'html-cov',
          require: ['chai']
        }
      },
      options: {
        files: 'test/server/*-spec.js',
        ui: 'bdd',
        colors: true
      }
    },

    simplemocha: {
      all: {
        options: {

        },
        src: ['test/server/**/*-spec.js']
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'bin/mysiteWWW'
        }
      },
      /*eslint-disable */
      prod: {
        options: {
          script: 'bin/mysiteWWW',
          node_env: 'production'
        }
      },
      test: {
        options: {
          script: 'bin/mysiteWWW',
          node_env: 'test'
        }
      }
      /*eslint-enable */
    },

    watch: {
      dev: {
        files: ['app.js', 'config.js', 'routes/*.js', 'public/**/*', 'helpers/*.js', 'bin/mysiteWWW'],
        tasks: ['test']
      }
    }
  }); //end initConfig

  grunt.registerTask('test', [ 'eslint', 'simplemocha', 'express:test']);
  grunt.registerTask('default', ['test', 'watch']);
  grunt.registerTask('serve', [ 'express:dev', 'watch']);

};
