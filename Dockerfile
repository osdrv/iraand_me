FROM busybox:musl
ADD public /usr/local/www/iraand.me
COPY config/iraand.me.nginx.conf /etc/nginx/conf.d/iraand.me.nginx.conf
RUN chown -R nobody:nogroup /usr/local/www/iraand.me
CMD ["sh"]
