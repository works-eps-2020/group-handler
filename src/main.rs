extern crate reqwest;

use actix_web::{error, web, App, Error, HttpServer, Result, HttpResponse};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Deserialize)]
struct Request {
    user_id: String,
}

#[derive(Deserialize)]
struct Response {
    data: RoleList,
}

#[derive(Deserialize)]
struct RoleList {
    user_role: Vec<String>,
}

async fn index(request: web::Json<Request>) -> Result<RoleList, reqwest::Error> {
   
    let request_url = "https://hasura.k8s.d0do.fr/v1/graphql";
    let body = json!({
        "query": "query ($auth0_id: String) {
            user_role(where: {user: {auth0_id: {_eq: $auth0_id}}}) {
              role {
                name
              }
              user {
                id
              }
            }
          }",
        "variables": {
            "auth0_id": request.user_id
        }
    });
    let client = Client::new();
    let response = client
        .post(request_url)
        .json(&body)
        .send()
        .await?
        .json::<Response>()
        .await?;
    
    for line in response.data.user_role.iter() {
        print!("{}", line);
    }
    Ok(response.data)
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/", web::post().to(index)))
        .bind("127.0.0.1:8080")?
        .run()
        .await
}

