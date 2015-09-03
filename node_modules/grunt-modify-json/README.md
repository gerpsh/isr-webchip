# grunt-modify-json

> Add or update properties of a JSON file

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-modify-json --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-modify-json');
```

## The "modify_json" task

### Overview
In your project's Gruntfile, add a section named `modify_json` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  modify_json: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.add
Type: `Boolean`
Default value: `false`

If `true`, properties if `fields` will be added to JSON file(s) regardless of whether the key exists.

#### options.fields
Type: `Object`
Default value: `{}`

A key-value pair object of properties to set in JSON file(s).

### Usage Examples

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  modify_json: {
    options: {
      add: true,
      fields: {
        version: "1.1.1"
      }
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
