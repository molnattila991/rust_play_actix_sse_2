use std::{collections::HashMap, sync::Arc};

use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use actix_web_lab::sse::{self, Data};
use serde::{Deserialize, Serialize};

#[get("/v1/events/messages/{name}")]
async fn greet(
    name: web::Path<String>,
    map: web::Data<Arc<HashMap<String, sse::Sender>>>,
) -> impl Responder {
    let (tx, rx) = sse::channel(10);
    tx.send(Data::new(
        serde_json::to_string(&ConnectionCreatedResponse {
            client_id: name.clone(),
            message: "Connection Created".to_string(),
        })
        .unwrap(),
    ))
    .await
    .unwrap();

    unsafe {
        let bad_reference = very_bad_function(map.as_ref().as_ref());
        bad_reference.insert(name.to_string(), tx);
        // println!("{}", bad_reference.clone().len());
    }

    rx
    // HttpResponse::Ok().body("oh boy")
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> std::io::Result<()> {
    let map: Arc<HashMap<String, sse::Sender>> = Arc::new(HashMap::new());

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(map.clone()))
            .route("/hello", web::get().to(|| async { "Hello World!" }))
            .service(greet)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SendMessageCommand {
    pub client_id_from: String,
    pub client_id_to: String,
    pub message: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionCreatedResponse {
    pub client_id: String,
    pub message: String,
}

unsafe fn very_bad_function<T>(reference: &T) -> &mut T {
    let const_ptr = reference as *const T;
    let mut_ptr = const_ptr as *mut T;
    &mut *mut_ptr
}
