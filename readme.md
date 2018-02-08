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

This prototype is divided into two parts:
- JWT minting service at which clients exchange the known Client Certificates
for the JWT.
- The API Proxy at which the JWT is validated.


## JWT microservice

The JWT microservice contains internal registry of known services.
The purpose of this prototype is to find a secure way of registering service and
issue service credentials (PKI certificates) so that they can be exchanged for
JWT at a later stage.

### Microservice responsibilities:
- issue JWT 
- refresh JWT
- Public Key registry

### Reading material
- https://www.youtube.com/watch?v=G7A6ftCbVQY (microXchg 2017 - Will Tran: Beyond OAuth2 – end to end microservice security)
- https://www.youtube.com/watch?v=67mezK3NzpU (100% Stateless with JWT (JSON Web Token) by Hubert Sablonnière)
- https://www.youtube.com/watch?v=dBdZrw2pPvc (Service to Service auth in a Microservices World)

### Possible consideration
- https://github.com/coreos/jwtproxy

### TODOs
- table of options considered
- centralised vs decentralised on preferred candidate
- how service and user link together for authentication
- authorisation requirements
