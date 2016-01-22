# koda.agency
The KODA website is built with [Jekyll](http://jekyllrb.com/), [SASS](http://sass-lang.com/), [Jeet](http://jeet.gs/), [Gulp](http://gulpjs.com/), and more.

## Installation
1. You'll need [Ruby](https://www.ruby-lang.org/en/) and [Node.js](http://nodejs.org/).
2. Install Bundler if you don't have it, `gem install bundler`.
3. Install Gulp if you don't have it, `npm -g install gulp`.
4. Install Bower if you don't have it, `npm -g install bower`.
6. In the project root, run `bundle install`.
7. In the project root, run `npm install`.
8. In the project root, run `bower install`.

## Building
1. To build the site, run `gulp build`.
2. To serve the site locally, `gulp serve`.

## Branches
1. Develop: New feature development.
2. Master: New content. Features from develop are merged into master and pushed to stage.
3. Release: Production code only. No commits, only merges from master.

### Development workflow
Something along these lines should be used by developers working on this site.

1. Clone the repository if you don't have it.
2. Checkout the develop branch, `git checkout develop`.
3. Make sure you're current, `git pull origin develop`.
4. Optionally grab the latest content by rebasing master from develop, `git rebase master`.'
5. Create a feature branch _off of develop_, `git checkout -b myfeature`.
6. Do work.
7. Merge your feature into develop, `git checkout develop && git merge myfeature`. Clean up and delete your feature branch.
8. Run `gulp serve` and make sure everything works.
9. Push your new feature, `git push origin develop`.
10. If it's ready for staging, merge into master, `git checkout master && git merge develop && git push origin master`.
11. To launch the new feature, `git checkout release && git merge master`.

## Content editing
Blog posts should be managed via [prose.io](http://prose.io/). Visit the website and, when prompted, authorize via GitHub. Select the [KODAagency/koda.agency](http://prose.io/#KODAagency/koda.agency) project.

## Testing, CI, and Deployment
The site is hosted on Amazon S3 where there are 2 buckets, one for staging mapped to http://stage.koda.agency and one for production mapped to http://www.koda.agency. A build on [Shippable](http://www.shippable.com/) will be triggered by any commit to the master or release branches. Shippable will:

1. Compile CSS using SASS.
2. Build the site using Jekyll.
3. Deploy the code to the appropriate S3 bucket: master will push to the staging server and release to the production server.
