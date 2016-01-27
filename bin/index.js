#!/usr/bin/env node

var fse = require('fs-extra');
var program = require('commander');
var colors = require('colors');

var process = require('process');
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
  console.log('my templates:'.blue);
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
    console.log('new template' + env);
    console.log('success! you can use it such as: ' + 'temp '.red + env.red + ' [name]'.red)
    return;
  }
  fse.ensureDirSync(path.join(TEMPDIR, _arr[0]));
  fse.copySync(CWD, path.join(TEMPDIR, _arr[0], _arr[1]));
  console.log('new template ===> ' + env);
  console.log('success! you can use it such as: ' + 'temp '.red + env.red + ' [name]'.red)
};

// 使用模版
var useTemplate = function(cmd, env) {
  var _arr = cmd.split(':');
  if (!_arr[0]) return;
  fs.access(path.join(TEMPDIR, _arr[0]), function(err) {
    if (!err) {
      if (!_arr[1]) {
        fse.copySync(path.join(TEMPDIR, _arr[0]), path.join(CWD, env));
        console.log('congratulations! you use template ' + cmd.red + ' generate ' + env.red);
        return;
      }
      fs.access(path.join(TEMPDIR, _arr[0], _arr[1]), function(err) {
        if (!err) {
          fse.copySync(path.join(TEMPDIR, _arr[0], _arr[1]), path.join(CWD, env));
          console.log('congratulations! you use template ' + cmd.red + ' generate ' + env.red);
        } else {
          console.log('sorry no such template'.red);
        }
      });
    } else {
      console.log('sorry no such template'.red);
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

// 列出模版列表
if (process.argv.length === 2) {
  listTemplate();
}

// 进入一个模版,抱歉我没有做到
program.command('where [env]')
  .description('show template path'.red)
  .action(function(env) {
    var _arr = env.split(':');
    if (!_arr[0]) return;
    fs.access(path.join(TEMPDIR, _arr[0]), function(err) {
      if (!err) {
        if (!_arr[1]) {
          console.log(path.join(TEMPDIR, _arr[0]));
          //execSync("alias tempdir='cd `temp where xiaoer`'");
          //execSync('open ' + path.join(TEMPDIR, _arr[0]))
          //process.chdir('../');
          return;
        }
        fs.access(path.join(TEMPDIR, _arr[0], _arr[1]), function(err) {
          if (!err) {
            console.log(path.join(TEMPDIR, _arr[0], _arr[1]));
          } else {
            console.log('sorry no such template'.red);
          }
        });
      } else {
        console.log('sorry no such template'.red);
      }
    });
  });

// 删除一个模版
program.command('rm [env]')
  .description('remove a template'.red)
  .action(function(env) {
    var _arr = env.split(':');
    if (!_arr[0]) return;
    fs.access(path.join(TEMPDIR, _arr[0]), function(err) {
      if (!err) {
        if (!_arr[1]) {
          fse.removeSync(path.join(TEMPDIR, _arr[0]));
          console.log('finish remove template '.red + env);
          return;
        }
        fs.access(path.join(TEMPDIR, _arr[0], _arr[1]), function(err) {
          if (!err) {
            fse.removeSync(path.join(TEMPDIR, _arr[0], _arr[1]));
            console.log('finish remove template '.red + env);
          } else {
            console.log('sorry no such template'.red);
          }
        });
      } else {
        console.log('sorry no such template'.red);
      }
    });
  });

// 清空所有模版
program.command('clear')
  .description('clear all templates, be careful'.red)
  .action(function() {
    fse.removeSync(TEMPDIR);
  });

// help
program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('  temp project:controler            ' + 'new a template named '.red + 'project:controler'.blue + ' use current directory'.red);
  console.log('  temp project:controler myControl  ' + 'use template '.red + 'project:controler'.blue + ' generate '.red + 'myControl'.blue + ' in current directory'.red);
});

program.parse(process.argv);
