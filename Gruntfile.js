module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			options: {
				sourcemap: 'none'
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'skin/scss',
					src: '*.scss',
					dest: 'skin/css',
					ext: '.css'
				}]
			}
		},
		watch: {
			sass: {
				files: ['skin/**/*.scss'],
				tasks: ['sass'],
				options: {
					spawn: true
				}
			}
		},
		sprite: {
			all: {
				src: ['skin/img/icons/_*.png'],
				dest: 'skin/img/icon-pack.png',
				destCss: 'skin/css/icon-pack.css',
				algorithm: 'binary-tree',
				padding: 3,
				cssVarMap: function (sprite) {
					sprite.name = sprite.name.replace(/^_/,'');
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-spritesmith');

	grunt.registerTask('default', function(){
		console.log('Please, use specific task: don\'t be lazy :)');
	});
};