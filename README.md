# another-aws-example
Another aws example is a public app to help you to start with serverless application

# Structure of the project
Three mains directories back, cdk, front.

back : microservices using AWS lambda
cdk : AWS infrastucture of the project
front : the front app using React and MUI

## Back application
The application uses AWS lambda. If you want to build the backend App you need to install node on your computer.

install :
https://nodejs.org/en/

*Currently I use nodejs 16.04 but higher version most likely be compatible*

In the "back" directory use these commands to respectivly : install dependencies, build project, run test.

```
npm i
npm run build
npm run test
```

*Note : if you are on Windows you need to install 7z and add it tou your PATH. Then in the webpack.config.js you need to uncomment two lines (l. 60-65)*

Default and linux:
```
    Object.keys(entry).forEach(name => {
              exec(`zip ${name}.zip ${name}.js`, { cwd: distPath })
              //exec(`7z a ${name}.zip ${name}.js`, { cwd: distPath })// FOR WINDOWS
            })
            exec(`rm *.js`, { cwd: distPath })
            //exec(`del *.js`, { cwd: distPath }); //FOR WINDOWS
```

Windows:
```
    Object.keys(entry).forEach(name => {
              //exec(`zip ${name}.zip ${name}.js`, { cwd: distPath })
              exec(`7z a ${name}.zip ${name}.js`, { cwd: distPath })// FOR WINDOWS
            })
            //exec(`rm *.js`, { cwd: distPath })
            exec(`del *.js`, { cwd: distPath }); //FOR WINDOWS
```

## CDK

If you want more information about CDK read https://aws.amazon.com/fr/cdk/

In the "cdk" directory use "npm i" to install dependencies.

The stack contains :
- 1 Dynamo table
- 1 S3 for static website
- A cloudfront distribution
- 5 Lambdas for back end microservices
- A cognito user pool
- An api gateway

### Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Front app