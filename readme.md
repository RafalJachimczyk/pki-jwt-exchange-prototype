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

## Components of the prototype

This prototype is divided into three parts:
- JWT minting service at which clients exchange the known Client Certificates
for the JWT.
- Service registry
- Authorisation registry
- The API Proxy at which client presenting it's JWT is authorised (or rather authorisation policies are retrieved and passed downstream).

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

#### Accepting certificates from third-party CAs

JWT microservice is to be capable of accepting client certificates generated from a third party CAs so that we can extend
number of organisations (i.e. external partners etc.) that we can issue JWTs for. 

This can be done by appending more CA certs into single PEM file. 

Alternative CA certs and Client cert/key pair to test this:

`$ openssl req -new -x509 -days 265 -keyout ./pki/CA/ca_alternative.key -out ./pki/CA/ca_alternative.crt`

`$ openssl genrsa -out ./pki/client_alternative.key 2048`

`$ openssl req -new -key ./pki/client_alternative.key -out ./pki/client_alternative.csr`

`$ openssl x509 -req -in ./pki/client_alternative.csr -CA ./pki/CA/ca_alternative.crt -CAkey ./pki/CA/ca_alternative.key -CAcreateserial -out ./pki/client_alternative.crt -days 100 -sha256` 

`$ touch pki/CA/ca_certs.pem`

`$ cat pki/CA/ca.crt pki/CA/ca_alternative.crt > pki/CA/ca_certs.pem`


## Service registry

### Service registry responsibilities:
- Service registry
  - registering a new service (by certificate subject line)
  
- Service authorisations
  - service <-> service ABAC
    - quota
    - resource path access
    - per environment setting of the above

### Examples of service registry / service discovery
- https://github.com/lyft/discovery
- https://github.com/Netflix/eureka/wiki/Eureka-at-a-glance
- More to list....

## Reading material
- https://www.datawire.io/guide/traffic/service-discovery-microservices/
- https://medium.com/airbnb-engineering/smartstack-service-discovery-in-the-cloud-4b8a080de619
- https://www.thoughtworks.com/radar/techniques/sidecars-for-endpoint-security
- https://www.youtube.com/watch?v=G7A6ftCbVQY (microXchg 2017 - Will Tran: Beyond OAuth2 – end to end microservice security)
- https://www.youtube.com/watch?v=67mezK3NzpU (100% Stateless with JWT (JSON Web Token) by Hubert Sablonnière)
- https://www.youtube.com/watch?v=dBdZrw2pPvc (Service to Service auth in a Microservices World)

## Problem definition statement
- TODO Provide secure authentication and authorisation for machine to machine communication

## Options considered
- Continuation and extension of existing PKI infrastructure using mutual TLS
- OAuth2 Client Credentials Grant i.e. use of client id and client secret
- Serverside JWTs - utilising existing PKI infrastructure for identity purposes - https://stackoverflow.com/questions/30523238/best-practices-for-server-side-handling-of-jwt-tokens
- Serverside JWTs - utilising issued client ids and asymmetric private keys (to review if this is different or extension of the options above e.g. for external partners)
- Kerberos - not sure https://security.stackexchange.com/questions/72179/continued-use-of-kerberos
- Anything else...?

## Option analysis list of factors (rough form for now)
- Industry direction
- Maturity
- Community support
- Complexity
- Dependencies
- Support and maintainance considerations
- Deployment considerations
- Licensing considerations
- To be continued

## Possible consideration
- https://github.com/coreos/jwtproxy

## TODOs
- table of options considered
- centralised vs decentralised on preferred candidate
- how service and user link together for authentication
- authorisation requirements
