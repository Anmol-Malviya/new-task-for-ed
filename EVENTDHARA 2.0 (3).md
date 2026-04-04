Functionality :



1.query handling 

2\. order handling 

3\. bot handling 

4\. payment handling 

5\. report/request

6\. call text via WhatsApp

7\. notification handling webhooks

8\. login/signup user

9\. login/signup vendor

10\. vendor dashboard

11\. user dashboard

12\. services portfolio

13\. packages

14\. frontend parts handling 

15\. bidding system

16\. auth

17\. security





TABLES :



1\. user 

2\. vendor 

3\. admin

4\. packages 

5\. pack type

6\. pack category

7\. service

8\. service package 

9\. orders

10\. payment

11\. query

12\. report

13\. reviews 

14\. chat

15\. category

16\. tags

17\. cart 

18\. location

19\. service location

20\. wishlist

21\.  OTP

22\. manual orders 

23\. service category 

24\. call logs details 

25\. new generated image data 

26\. bidding data 

27\. user service query 

28\. vendor locations 



\-->USER 

. ID

. NAME 

. NUMBER 

. ADDRESS 

. EMAIL

. IS BLACKLISTED

. PASSWORD 



\--> VENDOR 

. ID

. NAME 

. ADHAAR NO.

. NUMBER 

. EMAIL

. STORE NAME 

. PROBABLITY DISTRI.

. IS BLOCKLISTED 

. IS PREMIUM 

. ADDRESS 

. PASSWORD 

. RATINGS 

. IS VERIFIED





\--> ADMIN 

. id 

. ps 



\--> packages 

. id 

. name 



\--> PACKAGES TYPE 

. ID 

. name 

. base price 

. packages id 

. value rating 



\--> PACKAGE CATE 

. id 

. name 



\--> PACKAGE TYPE CAT

. id 

. pack type id 

. pack cat id



\--> services 

. id 

. name 

. short desc 

. long desc

. sky

. stock status 

. manage stock 

. cat id 

. menu order 

. purchase note 

. overriding policy 

. attributes 

. used 

. ratings 



\--> service packages 

. service id 

. pack cat id 

. packages id 

. pack type id 

. base price (default 0)

. id 





\--> category 

. id 

. name 

. number (value)





\--> services category 

.id 

.service id 

.cat id 



\--> tags 

. id 

. name 





\--> service tags 

. id 

. service id 

. tag id 





\--> location 

. id 

. name 





\--> service location 

. id 

. service id 

. location id 

. base price 

. sale price 





\--> query (with or without service)

. id 

. service id 

. customer id 

. location 

. service date 

. is urgent 

. approx budget

. is accepted 

. time stamp 





\--> query vendor 

. id 

. vendor id 

. has accepted 

. duration 

. status

. last msg at 

. has been replaced

. mode office 



\--> chats 

. id 

. query id 

. text msg 

. time stamp 

. img url

. sender 

. status

. WhatsApp msg id 

. is call log 

. is offer 

. service id 

. price 

. is portfolio



\--> Phone (call log)

. id

. chat id

. query id

. time stamp start

. time stamp end

. url audio

. text log



\-->Portfolio 

. Query id

. chat id

. service id's

. time stamp



\-->Orders

. id

. type

. query id

. vendor id

. payment id

. payment type

.

.

.

. Total price

. Total packages

. Total items 

. Customer ID

. Paid percent 

. Bidding order id

. from bidding

. location id

. address

. status 

. has paid full

. paid price

. time  stamp

. service date 



\--> Order package 

. id

. order id

. package id

. package type id

. base package price

. total package price



\--> order service

. id

. order id

. is in package

. sell price

. service id

. base price in package 

. package id

. order package id



\--> payment

. id

. payment type

. total price 

. paid price

. time stamp



\--> Cart

. id

. is package

. customer id

. service id

. total price

. location id

. is saved



\--> cart package 

. id

. cart id

. package id

. package type id

. base price

. total price



\--> cart package service

. cart package id

. service id

. base price

. package cat id



\--> OTP

. id

. time stamp 

. email

. OTP

. number



\--> wishlist

. id 

. service id

. is package

. customer id

. Location id



\--> wishlist package

. id

. wishlist id

. package id

. package type id

. base price

. total price



\--> wishlist package service

. wishlist package id 

. service id

. base price

. pack cat id

. id



\--> Manual order

. id

. vendor id

. vendor name

. vendor phone no

. address 

. service date

. customer id

. customer name 

. phone no

. payment type

. total paid

. service details



\--> Vendor locations

. id

. vendor id

. location id



\--> Package location

. id 

. location id

. package type id

. package id

. base price



\--> Address 

. customer id

. address

. city 

. country

. location id



\--> Reviews

. customer id

. order id

. review text 

. id

. has image 

. has video 

. service id 

. rating 

. package id

. package type



\--> Report

. id

. customer id

. vendor id

. reported id

. reason text

. has image



\--> Generated/Sent image

. id

. img desc

. other details

. customer id

. Expected price

. status

. location id

. time stamp



\--> Bidding 

. Gen ID

. id

. customer id

. vendor id

. vendor price

. status 

. date 

. address id



\--> Bidding order

. status

. bidding id

. customer id

. vendor id

. final price





\--> Query order 

. id

. Query id

. Query vendor id

. status 

. final price

. service id

. service details

. location id

. image url



\--> Premium vendor

. id

. vendor id

. premium id

. start date

. end date



\--> Premium packages

. id

. package name

. details

. price 

. timeline



\--> Image category

. id

. name



\--> images

. id

. image cat id

. name

. slot no.





. recorded call

. whatsapp notification

. image gener

. Chat bot



1. API/Services/
* Get

&#x20; . send-location

&#x20; . return

* Post

&#x20; .cat

* Get/

&#x20; 

