#!/usr/bin/env node

var fse = require('fs-extra');
var program = require('commander');
var colors = require('colors');
var multiline = require('multiline');

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var execSync = require('child_process').execSync;

var CWD = process.cwd();
var HOME = process.env.HOME;
var TEMPDIR = path.join(HOME, '.temp');
var pkg = require('../package.json');

// 确保文件夹存在
fse.ensureDirSync(TEMPDIR);

// 模版列表
var listTemplate = function() {
  var tpls = fs.readdirSync(TEMPDIR);
  console.log('my templates:'.red);
  tpls.forEach(function(item) {
    console.log(item.green.bold);
  })
  if (!tpls.length) {
    console.log('sorry! there is no template'.red);
  }
};

// 新建模版
var newTemplate = function(env) {
  if (!env) return;
  var _arr = env.split(':');
  if (!_arr[0]) return;
  if (!_arr[1]) {
    fse.copySync(CWD, path.join(TEMPDIR, _arr[0]));
    return;
  }
  fse.ensureDirSync(path.join(TEMPDIR, _arr[0]));
  fse.copySync(CWD, path.join(TEMPDIR, _arr[0], _arr[1]));
};

// 使用模版
var useTemplate = function(cmd, env) {
  var _arr = cmd.split(':');
  if (!_arr[0]) return;
  fs.access(path.join(TEMPDIR, _arr[0]), function(err) {
    if (!err) {
      if (!_arr[1]) {
        fse.copySync(path.join(TEMPDIR, _arr[0]), path.join(CWD, env));
        return;
      }
      fs.access(path.join(TEMPDIR, _arr[0], _arr[1]), function(err) {
        if (!err) {
          fse.copySync(path.join(TEMPDIR, _arr[0], _arr[1]), path.join(CWD, env));
        } else {
          console.log('no such template'.red);
        }
      });
    } else {
      console.log('no such template'.red);
    }
  });
};

program.version(pkg.version, '-v, --version')
  .arguments('<cmd> [env]')
  .action(function (cmd, env) {
    if (!env) {
      newTemplate(cmd);
    } else {
      useTemplate(cmd, env);
    }
  });

process.argv = process.argv.map(function (arg) {
  return (arg === '-V') ? '-v' : arg;
});
if (process.argv.length === 2) {
  listTemplate();
}



// 新建一个模版
//program.command('new [env]')
//  .description('new template')
//  .action(function(env) {
//    if (!env) return;
//    var _arr = env.split(':');
//    if (!_arr[0]) return;
//    if (!_arr[1]) {
//      fse.copySync(CWD, path.join(TEMPDIR, _arr[0]));
//      return;
//    }
//    fse.ensureDirSync(path.join(TEMPDIR, _arr[0]));
//    fse.copySync(CWD, path.join(TEMPDIR, _arr[0], _arr[1]));
//  });

// 使用模版
program.command('new [env]')
  .description('new template')
  .action(function(env) {
    if (!env) return;
    var _arr = env.split(':');
    if (!_arr[0]) return;
    if (!_arr[1]) {
      fse.copySync(CWD, path.join(TEMPDIR, _arr[0]));
      return;
    }
    fse.ensureDirSync(path.join(TEMPDIR, _arr[0]));
    fse.copySync(CWD, path.join(TEMPDIR, _arr[0], _arr[1]));
  });
// 进入一个模版

// 列出模版列表


program.parse(process.argv);
