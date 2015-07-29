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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.registerTask('default', ['sass']);
};