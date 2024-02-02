# Pie Madness API

This repo contains the API code for piemadness.com, a website / forum where pie fans can chat amongst themselves about the annual Pie Madness contest where pie flavors compete in a bracket format. 

## Steps to get pie madness backend running locally

The data for piemadness.com has been copied with crtical user info obfuscated. This gives you a chance to run the website locally just as it runs live on piemadness.com by running a local instance of dynamodb and using SAM local.

If you'd like to install everything all at once before going through these instructions, you'll need to already have or install
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [AWS CLI](https://aws.amazon.com/cli/) 
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
These can all be installed with Brew if you prefer

1. Clone the code from the repo to your machine

2. Download and install Docker desktop if you haven’t already. Run `docker-compose up` in the root of the project. This will install a local dockerized instance of dynamodb on your machine. Use docker desktop to confirm that your database is running. You can also confirm with the AWS cli by running `aws dynamodb list-tables --endpoint http://localhost:8000` in your terminal. The list of tables should be empty.

3. Run the create_db script by running `npm run create_db` in the root of the /api directory. Now if you run `aws dynamodb list-tables --endpoint http://localhost:8000` you should see the tables. Then, run the insert_data script by running `npm run insert_data` in the root of the /api directory. Check if this succeeds by running `aws dynamodb scan --table-name pie_madness_local --endpoint http://localhost:8000`

5. Run `npm install` at root of /api directory to install npm packages.

6. Navigate back to the root of this repo. Install the sam cli with Brew or according to aws official documentation. Run `sam local start-api`. This should start a local instance of the pie madness API with data from your local dynamodb instance. Try it out by going to localhost:3000/posts/contestId/2023 in your browser