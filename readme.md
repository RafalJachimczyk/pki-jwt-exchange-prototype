## Hypothesis

PKI authentication is a well known way of authenticating devices (software
components) and people. Client certificates serve as a secure means of authentication
but lack depth of data that can be "attached" to them. Typically client certificate
contain a subject field (SN) which is often used as a form of identifier.

This proposal is for a system where client certificates are augumented with extra
information (claims) that can be validated in an offline fashion. This reduces the
amount of expensive traffic and computation on the central infrastructure.

The "augumentation" of client certificates is possible when the these certs are
exchanged for JWT tokens. Extra claims can be attached to these JWTs.

This approach has multiple advantages over "vanilla" mutual certificate authentication:
- the complexity of retrieval of the extra claims is at the JWT minting service
  and not with the end user/integrating system.
- authorisations can be ensured in an offline fashion, dramatically reducing traffic
  to the central infrastructure
- JWTs are compatible with existing Access Proxy

## Purpose of the prototype

This prototype is divided into three parts:
- JWT minting service at which clients exchange the known Client Certificates
for the JWT.
- Service registry
- The API Proxy at which the JWT is validated.

## Nomenclature

- Service - For the purpose of this prototype a Service describes either a client application or a server application. Services access other services provided the authorisation is granted. 

- CA - Certificate Authority

## JWT microservice

The JWT microservice contains internal registry of known services.
The purpose of this prototype is to find a secure way of registering service and
issue service credentials (PKI certificates) so that they can be exchanged for
JWT at a later stage.

### Microservice responsibilities:
- Issue JWT
- Refresh JWT

### PKI 

JWT microservice requires client applications (services) to present their client certificate which is then validated against a table of known CAs. This microservice also signs any JWTs issued by it's private key. 

#### Note to myself
We should be able to load multiple CA certs so that client certs generated from these are OK.

For the prototype we will generate the root CA certificate, which can then be used to generate client and server certificates and private key pairs:

`$ mkdir pki`

`$ mkdir pki/CA`

`$ openssl req -new -x509 -days 265 -keyout ./pki/CA/ca.key -out ./pki/CA/ca.crt`

Now for the client public/private key pair: 

`$ openssl genrsa -out ./pki/client.key 2048` - generates client private key

`$ openssl req -new -key ./pki/client.key -out ./pki/client.csr` - generates client certificate signing request (CSR)

`$ openssl x509 -req -in ./pki/client.csr -CA ./pki/CA/ca.crt -CAkey ./pki/CA/ca.key -CAcreateserial -out ./pki/client.crt -days 100 -sha256` - Generates public key signed by the CA's root certificate

and Server public/private key pair: 

`$ openssl genrsa -out ./pki/server.key 2048` - generates client private key

`$ openssl req -new -key ./pki/server.key -out ./pki/server.csr` - generates client certificate signing request (CSR)

`$ openssl x509 -req -in ./pki/server.csr -CA ./pki/CA/ca.crt -CAkey ./pki/CA/ca.key -CAcreateserial -out ./pki/client.crt -days 100 -sha256` - Generates public key signed by the CA's root certificate


## Service registry

### Service registry responsibilities:
- Service registry
  - registering a new service (by certificate subject line)
  
- Service authorisations
  - service <-> service ABAC
    - quota
    - resource path access
    - per environment setting of the above


## Reading material
- https://www.thoughtworks.com/radar/techniques/sidecars-for-endpoint-security
- https://www.youtube.com/watch?v=G7A6ftCbVQY (microXchg 2017 - Will Tran: Beyond OAuth2 – end to end microservice security)
- https://www.youtube.com/watch?v=67mezK3NzpU (100% Stateless with JWT (JSON Web Token) by Hubert Sablonnière)
- https://www.youtube.com/watch?v=dBdZrw2pPvc (Service to Service auth in a Microservices World)

## Possible consideration
- https://github.com/coreos/jwtproxy

## TODOs
- table of options considered
- centralised vs decentralised on preferred candidate
- how service and user link together for authentication
- authorisation requirements
