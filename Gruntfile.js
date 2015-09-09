module.exports = function(grunt) {
    grunt.initConfig({
	    typescript: {
		main: {
		    src: ['botmain/*.ts'],
		    // dest: 'js',
		    options: {
			noImplicitAny: true,
			module:        'commonjs',
			target:        'es5',
			comments:      true
		    }
		}
	    },
	    tsd : {
		refresh: {
		    options: {
			command: 'reinstall',
			latest: true,
			config: './tsd.json',
			opts: {}
		    }
		}
	    }
	});

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-tsd');

    grunt.registerTask(
		       "default",
		       "TypeScriptをコンパイル",
    ["typescript:main"]
		       );
};

// @see http://qiita.com/akanehara/items/ea40bea98e9029c730ca
